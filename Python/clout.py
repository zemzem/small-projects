import re
#Alexander Semenyuk
#Python 3

#Simulated graph: dict of person objects with name as unique key
people = {}

class Person(object):
	def __init__(self, name, follows='', fby = None):
		self.name = name
		self.follows = follows
		if(fby):
			self.fby = [fby]
		else:
			self.fby = []
	def __eq__(self, other):
		return self.name == other.name
	def remove_follower(self, name):
		if name in self.fby:
			self.fby.remove(name)
	def __hash__(self):
		return hash(self.name)

#returns Person: if they don't exist create them
def aquire_node(name):
	if(name not in people):
		people[name] = Person(name)
	return people[name]
	

#Adds new link between two people, removes old link in the process
def add_link(name1, name2):
	if(name1 == name2):
		print("Interesting, but that doesn't make sense.")
		return
	p1 = aquire_node(name1)
	p2 = aquire_node(name2)
	#Remove old link IF someone else was followed by them
	if p1.follows:
		people[p1.follows].remove_follower(p1.name)
	p1.follows = p2.name
	p2.fby.append(p1.name)
	print("OK!")


#Recursively finds followers by following link via each person's followers
#Circular references are handled via the visted node set
def calculate_followers(name, visited):
	visited.append(name)
	fby = list(set(people[name].fby)-set(visited))
	f = 0
	for x in fby:
		if(x not in visited):
			f += calculate_followers(x, visited) + 1
	return f

#Display follower info for one person (taking into account plurality)
def show(name):
	visited = []
	if name in people:
		fcount = calculate_followers(name, visited)
		print(name + " has " + str("no" if fcount==0 else fcount) + " follower"+ ("" if fcount==1 else "s"))
	else:
		print(name + " has no followers")#If they dont exist they dont have followers

def show_all():
	all_people = people.keys()
	if len(all_people)==0:
		print("No people in graph: see 'help' for instructions")
	for name in all_people:
		show(name)

def show_help():
	print("1. Add a relationship: <person_a> follows <person_b>")
	print("2. Determine **extended** influence of a person: clout <person>")
	print("3. Determine **extended** influence of all people in the graph: clout")

def parse_cmd(cmd):
	err_msg = "Not a valid command. Type 'help' for usage."
	if re.search(r"(clout|follows|help)", cmd):
		names = re.match(r'(.+) follows (.+)', cmd, re.M|re.I)
		out = re.match(r'clout (.+)', cmd, re.M)
		if names: 
			add_link(names.group(1),names.group(2))
		elif out:
			show(out.group(1))
		elif cmd.strip() == "clout":
			show_all()
		elif cmd.strip() == "help":
			show_help()
		else:
			print(err_msg)
		
	else:
		print(err_msg)
    

if __name__ == "__main__":
	while 1:
		x = input(":")
		parse_cmd(x)
